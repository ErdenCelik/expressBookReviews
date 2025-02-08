const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  const user = users.find(user => user.username === username);
  if (user) {
    return false;
  }
  return true;
}

const authenticatedUser = (username,password)=>{
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return false;
  }
  return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username: username }, "your-secret-key", { expiresIn: '1h' });
  req.session.token = token;
  return res.status(200).json({ message: "Customer successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.session.token;
  const isbn = req.params.isbn;
  const { review } = req.body;

  if (!token) {
    return res.status(401).json({ message: "You need to log in first" });
  }
  if (!isbn || !review) {
    return res.status(401).json({ message: "Isbn and Review are required" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if(books[isbn].reviews[username]){
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added successfully" });
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.session.token;
  const isbn = req.params.isbn;


  if (!token) {
    return res.status(401).json({ message: "You need to log in first" });
  }
  if (!isbn) {
    return res.status(401).json({ message: "Isbn are required" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if(!books[isbn].reviews[username]){
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });

  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;