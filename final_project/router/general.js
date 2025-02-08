const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({ message: "username and password parameter is required" });
  }
  if(!isValid(username)){
    return res.status(400).json({ message: "username allready exist" });
  }
  users.push({username,password})

  return res.status(200).json({message: "Customer successfully registred. Not you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks()
      .then(data => {
        return res.status(200).json(data);
      })
      .catch(error => {
        return res.status(500).json({error: error});
      });
});
function getBooks() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("Error fetching books");
    }
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({ message: "Isbn parameter is required" });
  }
  function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      const book = books[isbn];

      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  }
  getBookByISBN(isbn)
      .then(book => {
        return res.status(200).json(book);
      })
      .catch(error => {
        return res.status(404).json({ message: error });
      });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  if (!author) {
    return res.status(400).json({ message: "Author parameter is required" });
  }
  function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
      const filteredBooks = [];

      for (let id in books) {
        if (books[id].author.includes(author)) {
          filteredBooks.push(books[id]);
        }
      }

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for this author");
      }
    });
  }

  return getBooksByAuthor(author)
      .then(filteredBooks => {
        return res.status(200).json(filteredBooks);
      })
      .catch(error => {
        return res.status(404).json({ message: error });
      });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  if (!title) {
    return res.status(400).json({ message: "Title parameter is required" });
  }
  function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
      const title_books = [];

      for (let id in books) {
        if (books[id].title.includes(title)) {
          const bookWithIsbnFirst = { isbn: id, ...books[id] };
          title_books.push(bookWithIsbnFirst);
        }
      }

      if (title_books.length > 0) {
        resolve(title_books);
      } else {
        reject("No books found with that title");
      }
    });
  }
  return getBooksByTitle(title)
      .then(title_books => {
        return res.status(200).json(title_books);
      })
      .catch(error => {
        return res.status(404).json({ message: error });
      });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({ message: "Isbn parameter is required" });
  }
  const book = books[isbn];
  if(!book){
    return res.status(400).json({ message: "Isbn not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;