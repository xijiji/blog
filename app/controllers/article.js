var mongoose = require('mongoose')
var Article = mongoose.model('Article')
var Category = mongoose.model('Category')
var Comment = mongoose.model('Comment')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')
var markdown = require('markdown').markdown

// detail page
exports.detail = function(req, res) {
  var id = req.params.id

  Article.update({_id: id}, {$inc: {pv: 1}}, function(err) {
    if (err) {
      console.log(err)
    }
  })

  Article.findById(id, function(err, article) {
    Comment
      .find({article: id})
      .populate('from', 'name avatar') //查询出你所需要的字段
      .populate('reply.from reply.to', 'name avatar')
      .exec(function(err, comments) {
      	article.content = markdown.toHTML(article.content)
        res.render('detail', {
          title: 'blog 详情页',
          article: article,
          comments: comments
        })
      })
  })
}

// admin new page
exports.new = function(req, res) {
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: 'blog 文章录入页',
      categories: categories,
      article: {}
    })
  })
}

// admin update page
exports.update = function(req, res) {
  var id = req.params.id

  if (id) {
    Article.findById(id, function(err, article) {
      Category.find({}, function(err, categories) {
        res.render('admin', {
          title: '文章编辑页',
          article: article,
          categories: categories
        })
      })
    })
  }
}

// admin poster
exports.savePoster = function(req, res, next) {
  var posterData = req.files.uploadPoster
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename

  if (originalFilename) {
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now()
      var type = posterData.type.split('/')[1]
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)

      fs.writeFile(newPath, data, function(err) {
        req.poster = poster
        next()
      })
    })
  }
  else {
    next()
  }
}

// admin post article
exports.save = function(req, res) {
  var id = req.body.article._id
  var articleObj = req.body.article
  var _article

  if (req.poster) {
    articleObj.poster = req.poster
  }

  if (id) {
    Article.findById(id, function(err, article) {
      if (err) {
        console.log(err)
      }

      _article = _.extend(article, articleObj)
      _article.save(function(err, article) {
        if (err) {
          console.log(err)
        }

        res.redirect('/article/' + article._id)
      })
    })
  }
  else {
    _article = new Article(articleObj)

    var categoryId = articleObj.category
    var categoryName = articleObj.categoryName

    _article.save(function(err, article) {
      if (err) {
        console.log(err)
      }
      if (categoryId) {
        Category.findById(categoryId, function(err, category) {
          category.articles.push(article._id)

          category.save(function(err, category) {
            res.redirect('/article/' + article._id)
          })
        })
      }
      else if (categoryName) {
        var category = new Category({
          name: categoryName,
          articles: [article._id]
        })

        category.save(function(err, category) {
          article.category = category._id
          article.save(function(err, article) {
            res.redirect('/article/' + article._id)
          })
        })
      }
    })
  }
}

// list page
exports.list = function(req, res) {
  Article.find({})
    .populate('category', 'name')
    .exec(function(err, articles) {
      if (err) {
        console.log(err)
      }

      res.render('list', {
        title: 'blog列表页',
        articles: articles
      })
    })
}

// list page
exports.del = function(req, res) {
  var id = req.query.id

  if (id) {
    Article.remove({_id: id}, function(err, article) {
      if (err) {
        console.log(err)
        res.json({success: 0})
      }
      else {
        res.json({success: 1})
      }
    })
  }
}