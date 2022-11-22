const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const { MONGO_URI } = process.env;
mongoose.connect(MONGO_URI);

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    commentcount: Number,
    comments: Array,
  },
  { versionKey: false },
);

const Book = new mongoose.model('Book', BookSchema);

module.exports = function (app) {
  app.route('/api/books')
    .get((req, res) => {
      Book.find((err, data) => (res.json(data)));
    })

    .post((req, res) => {
      const { title } = req.body;

      if (title) {
        const book = new Book({ title, commentcount: 0 });

        book.save((err, data) => {
          if (err) {
            res.send({ error: err });
          } else {
            res.json({ title: data.title, id: data.id });
          }
        });
      } else {
        res.send('missing required field title');
      }
    })

    .delete((req, res) => {
      // if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, data) => {
        if (!err && data) {
          res.send('complete delete successful');
        }
      });
    });

  app.route('/api/books/:id')
    .get((req, res) => {
      const bookid = req.params.id;
      // json res format: {"id": bookid, "title": book_title, "comments": [comment,comment,...]}

      Book.findById(bookid, (err, book) => {
        if (book) {
          res.json({
            id: book.id,
            title: book.title,
            comments: book.comments,
          });
        } else {
          res.send('no book exists');
        }
      });
    })

    .post((req, res) => {
      const bookid = req.params.id;
      const { comment } = req.body;
      // json res format same as .get

      if (comment) {
        Book.findByIdAndUpdate(bookid, {
          $push: { comments: comment },
          $inc: { commentcount: 1 },
        }, {
          new: true,
        }, (err, book) => {
          if (book) {
            res.json({
              id: book.id,
              title: book.title,
              comments: book.comments,
            });
          } else {
            res.send('no book exists');
          }
        });
      } else {
        res.send('missing required field comment');
      }
    })

    .delete((req, res) => {
      const bookid = req.params.id;
      // if successful response will be 'delete successful'

      Book.findByIdAndDelete(bookid, (err, tempBook) => {
        if (!err && tempBook) {
          res.json('delete successful');
        } else {
          res.send('no book exists');
        }
      });
    });
};
