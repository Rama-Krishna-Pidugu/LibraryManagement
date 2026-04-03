(() => {
  const api = async (path, options = {}) => {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();
    if (!res.ok) {
      const msg = body && body.message ? body.message : (typeof body === 'string' ? body : 'Request failed');
      throw new Error(msg);
    }
    return body;
  };

  const setMsg = (text, kind) => {
    const el = document.getElementById('msg');
    if (!el) return;
    el.classList.remove('success', 'error');
    if (!text) {
      el.textContent = '';
      return;
    }
    if (kind === 'ok') el.classList.add('success');
    if (kind === 'error') el.classList.add('error');
    el.textContent = text;
  };

  const escapeHtml = (s) =>
    (s ?? '').toString().replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  const normalizeEmail = (raw) => {
    const s = (raw ?? '').toString().trim();
    const m = /^\[([^\]]+)\]\(mailto:([^)]+)\)$/.exec(s);
    if (m) return m[2] || m[1];
    return s;
  };

  const roleFromUser = (u) => (u && u.role ? u.role : null);

  const initLoginPage = () => {
    const form = document.getElementById('loginForm');
    const useStudent = document.getElementById('useStudent');
    const email = form?.querySelector('input[name="email"]');
    const password = form?.querySelector('input[name="password"]');

    useStudent?.addEventListener('click', () => {
      email.value = 'student@library.com';
      password.value = 'student123';
      setMsg('Filled student credentials.', 'ok');
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      setMsg('Logging in...');
      try {
        await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) });
        const me = await api('/api/me');
        const role = roleFromUser(me);
        if (role === 'ADMIN') window.location.href = '/ui/admin';
        else if (role === 'STUDENT') window.location.href = '/ui/student';
        else setMsg('Login ok, but role is missing.', 'error');
      } catch (err) {
        setMsg(err.message, 'error');
      }
    });
  };

  const initAdminPage = () => {
    const booksTbody = document.querySelector('#booksTable tbody');
    const usersTbody = document.querySelector('#usersTable tbody');
    const addBookForm = document.getElementById('addBookForm');
    const addStudentForm = document.getElementById('addStudentForm');

    const loadBooks = async () => {
      const books = await api('/api/admin/books');
      booksTbody.innerHTML = '';
      for (const b of books) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.id}</td>
          <td>${escapeHtml(b.title)}</td>
          <td>${escapeHtml(b.author)}</td>
          <td>${b.availableCopies}</td>
          <td><button class="danger" data-id="${b.id}">Remove</button></td>
        `;
        tr.querySelector('button')?.addEventListener('click', async () => {
          setMsg('Removing book...');
          try {
            await api(`/api/admin/books/${b.id}`, { method: 'DELETE' });
            setMsg('Book removed.', 'ok');
            await loadBooks();
          } catch (err) {
            setMsg(err.message, 'error');
          }
        });
        booksTbody.appendChild(tr);
      }
    };

    const loadUsers = async () => {
      const users = await api('/api/admin/users');
      usersTbody.innerHTML = '';
      for (const u of users) {
        const tr = document.createElement('tr');
        const email = normalizeEmail(u.email);
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(email)}</td>
          <td>${escapeHtml(u.role)}</td>
          <td><button class="danger" data-id="${u.id}">Delete</button></td>
        `;
        tr.querySelector('button')?.addEventListener('click', async () => {
          if (!confirm('Delete this user?')) return;
          setMsg('Deleting user...');
          try {
            await api(`/api/admin/users/${u.id}`, { method: 'DELETE' });
            setMsg('User deleted.', 'ok');
            await loadUsers();
          } catch (err) {
            setMsg(err.message, 'error');
          }
        });
        usersTbody.appendChild(tr);
      }
    };

    document.getElementById('refreshBooks')?.addEventListener('click', () => loadBooks().catch(err => setMsg(err.message, 'error')));
    document.getElementById('refreshUsers')?.addEventListener('click', () => loadUsers().catch(err => setMsg(err.message, 'error')));

    addBookForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(addBookForm);
      const payload = {
        title: formData.get('title'),
        author: formData.get('author'),
        availableCopies: Number(formData.get('availableCopies') || 0)
      };
      setMsg('Adding book...');
      try {
        await api('/api/admin/books', { method: 'POST', body: JSON.stringify(payload) });
        addBookForm.reset();
        setMsg('Book added.', 'ok');
        await loadBooks();
      } catch (err) {
        setMsg(err.message, 'error');
      }
    });

    addStudentForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = addStudentForm.querySelector('input[name="name"]');
      const emailInput = addStudentForm.querySelector('input[name="email"]');
      const passwordInput = addStudentForm.querySelector('input[name="password"]');

      const name = (nameInput?.value ?? '').trim();
      const email = normalizeEmail((emailInput?.value ?? '').trim());
      const password = (passwordInput?.value ?? '').trim();

      if (!name || !email || !password) {
        setMsg('Name, email and password are required.', 'error');
        return;
      }

      const payload = {
        name,
        email,
        password
      };
      setMsg('Adding student...');
      try {
        await api('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
        addStudentForm.reset();
        setMsg('Student added.', 'ok');
        await loadUsers();
      } catch (err) {
        setMsg(err.message, 'error');
      }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      setMsg('Logging out...');
      try {
        await api('/auth/logout', { method: 'POST' });
        window.location.href = '/ui/login';
      } catch (err) {
        setMsg(err.message, 'error');
      }
    });

    Promise.all([loadBooks(), loadUsers()]).then(() => setMsg('Ready.', 'ok')).catch(err => setMsg(err.message, 'error'));
  };

  const initStudentPage = () => {
    const booksTbody = document.querySelector('#availableTable tbody');
    const txTbody = document.querySelector('#txTable tbody');

    const renderBooks = (books) => {
      booksTbody.innerHTML = '';
      for (const b of books) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${b.id}</td>
          <td>${escapeHtml(b.title)}</td>
          <td>${escapeHtml(b.author)}</td>
          <td>${b.availableCopies}</td>
          <td><button data-id="${b.id}" ${b.availableCopies > 0 ? '' : 'disabled'}>Borrow</button></td>
        `;
        tr.querySelector('button')?.addEventListener('click', async () => {
          setMsg('Borrowing...');
          try {
            await api(`/api/student/transactions/borrow/${b.id}`, { method: 'POST' });
            setMsg('Borrowed.', 'ok');
            await refreshTx();
            await loadAvailable();
          } catch (err) {
            setMsg(err.message, 'error');
          }
        });
        booksTbody.appendChild(tr);
      }
    };

    const loadAvailable = async () => {
      const books = await api('/api/student/books/available');
      renderBooks(books);
    };

    const search = async () => {
      const q = document.getElementById('searchQuery')?.value?.trim();
      if (!q) return loadAvailable();
      const books = await api(`/api/student/books/search?query=${encodeURIComponent(q)}`);
      renderBooks(books);
    };

    const refreshTx = async () => {
      const txs = await api('/api/student/transactions/me');
      txTbody.innerHTML = '';
      for (const t of txs) {
        const returned = t.returnDate ? escapeHtml(t.returnDate) : '-';
        const paid = t.paid ? 'Yes' : 'No';
        const fine = (t.fine ?? 0).toFixed(2);
        const bookName = t.book ? `${escapeHtml(t.book.title)} (${escapeHtml(t.book.author)})` : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.id}</td>
          <td>${bookName}</td>
          <td>${escapeHtml(t.issueDate)}</td>
          <td>${escapeHtml(t.dueDate)}</td>
          <td>${returned}</td>
          <td>${fine}</td>
          <td>${paid}</td>
          <td class="row"></td>
        `;

        const actionsTd = tr.querySelector('td.row');
        if (!t.returnDate) {
          const btn = document.createElement('button');
          btn.className = 'secondary';
          btn.textContent = 'Return';
          btn.addEventListener('click', async () => {
            setMsg('Returning...');
            try {
              await api(`/api/student/transactions/return/${t.id}`, { method: 'POST' });
              setMsg('Returned.', 'ok');
              await refreshTx();
              await loadAvailable();
            } catch (err) {
              setMsg(err.message, 'error');
            }
          });
          actionsTd.appendChild(btn);
        } else if ((t.fine ?? 0) > 0 && !t.paid) {
          const btn = document.createElement('button');
          btn.className = '';
          btn.textContent = 'Pay fine';
          btn.addEventListener('click', async () => {
            setMsg('Paying fine...');
            try {
              await api(`/api/student/transactions/${t.id}/pay`, { method: 'POST' });
              setMsg('Fine marked as paid.', 'ok');
              await refreshTx();
            } catch (err) {
              setMsg(err.message, 'error');
            }
          });
          actionsTd.appendChild(btn);
        } else {
          actionsTd.textContent = '-';
        }

        txTbody.appendChild(tr);
      }
    };

    document.getElementById('availableBtn')?.addEventListener('click', () => loadAvailable().catch(err => setMsg(err.message, 'error')));
    document.getElementById('searchBtn')?.addEventListener('click', () => search().catch(err => setMsg(err.message, 'error')));
    document.getElementById('refreshTx')?.addEventListener('click', () => refreshTx().catch(err => setMsg(err.message, 'error')));

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      setMsg('Logging out...');
      try {
        await api('/auth/logout', { method: 'POST' });
        window.location.href = '/ui/login';
      } catch (err) {
        setMsg(err.message, 'error');
      }
    });

    Promise.all([loadAvailable(), refreshTx()]).then(() => setMsg('Ready.', 'ok')).catch(err => setMsg(err.message, 'error'));
  };

  window.LibraryUI = { initLoginPage, initAdminPage, initStudentPage };
})();

