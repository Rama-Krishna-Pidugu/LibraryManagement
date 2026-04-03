package LibraryManagement.LibraryManagement.controller;

import LibraryManagement.LibraryManagement.entity.Transaction;
import LibraryManagement.LibraryManagement.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/borrow/{bookId}")
    public ResponseEntity<Transaction> borrowBook(@PathVariable Long bookId, Authentication authentication) {
        return ResponseEntity.ok(transactionService.borrowBook(bookId, authentication.getName()));
    }

    @PostMapping("/return/{transactionId}")
    public ResponseEntity<Transaction> returnBook(@PathVariable Long transactionId, Authentication authentication) {
        return ResponseEntity.ok(transactionService.returnBook(transactionId, authentication.getName()));
    }

    @PostMapping("/{transactionId}/pay")
    public ResponseEntity<Transaction> payFine(@PathVariable Long transactionId, Authentication authentication) {
        return ResponseEntity.ok(transactionService.payFine(transactionId, authentication.getName()));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Transaction>> myTransactions(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getMyTransactions(authentication.getName()));
    }
}
