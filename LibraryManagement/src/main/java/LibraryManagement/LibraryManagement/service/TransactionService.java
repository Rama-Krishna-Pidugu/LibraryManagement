package LibraryManagement.LibraryManagement.service;

import LibraryManagement.LibraryManagement.entity.Book;
import LibraryManagement.LibraryManagement.entity.Transaction;
import LibraryManagement.LibraryManagement.entity.User;
import LibraryManagement.LibraryManagement.exception.ResourceNotFoundException;
import LibraryManagement.LibraryManagement.repository.BookRepository;
import LibraryManagement.LibraryManagement.repository.TransactionRepository;
import LibraryManagement.LibraryManagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    @Value("${library.borrow.days:14}")
    private int borrowDays;

    @Value("${library.fine.per-day:10.0}")
    private double finePerDay;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public Transaction borrowBook(Long bookId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available for this book");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setBook(book);
        transaction.setIssueDate(LocalDate.now());
        transaction.setDueDate(LocalDate.now().plusDays(borrowDays));
        transaction.setPaid(false);
        transaction.setFine(0.0);

        return transactionRepository.save(transaction);
    }

    public Transaction returnBook(Long transactionId, String userEmail) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!transaction.getUser().getEmail().equals(userEmail)) {
            throw new IllegalStateException("You can return only your own borrowed book");
        }
        if (transaction.getReturnDate() != null) {
            throw new IllegalStateException("Book already returned");
        }

        LocalDate returnDate = LocalDate.now();
        transaction.setReturnDate(returnDate);

        long lateDays = ChronoUnit.DAYS.between(transaction.getDueDate(), returnDate);
        if (lateDays > 0) {
            transaction.setFine(lateDays * finePerDay);
            transaction.setPaid(false);
        } else {
            transaction.setFine(0.0);
            transaction.setPaid(true);
        }

        Book book = transaction.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        return transactionRepository.save(transaction);
    }

    public Transaction payFine(Long transactionId, String userEmail) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!transaction.getUser().getEmail().equals(userEmail)) {
            throw new IllegalStateException("You can pay only your own fine");
        }
        if (transaction.getFine() <= 0) {
            throw new IllegalStateException("No fine due");
        }
        transaction.setPaid(true);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getMyTransactions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return transactionRepository.findByUserId(user.getId());
    }
}
