var mongoose = require('mongoose')
var Article = mongoose.model('Article')
var Category = mongoose.model('Category')

// index page
exports.index = function(req, res) {
  Category
    .find({})
    .populate({
      path: 'articles',
      select: 'title poster pv',
      options: { limit: 6 }
    })
    .exec(function(err, categories) {
      if (err) {
        console.log(err)
      }

      res.render('index', {
        title: 'blog 首页',
        categories: categories
      })
    })
}

//about page
exports.about = function(req, res){
  res.render('about', {
    title: 'about 页面'
  })
}
// search page
exports.search = function(req, res) {
  var catId = req.query.cat
  var q = req.query.q
  var page = parseInt(req.query.p, 10) || 0
  var count = 2
  var index = page * count

  if (catId) {
    Category
      .find({_id: catId})
      .populate({
        path: 'articles',
        select: 'title poster'
      })
      .exec(function(err, categories) {
        if (err) {
          console.log(err)
        }
        var category = categories[0] || {}
        var articles = category.articles || []
        var results = articles.slice(index, index + count)

        res.render('results', {
          keyword: category.name,
          currentPage: (page + 1),
          query: 'cat=' + catId,
          totalPage: Math.ceil(articles.length / count),
          articles: results
        })
      })
  }else {
    Article
      .find({title: new RegExp(q + '.*', 'i')})
      .exec(function(err, articles) {
        if (err) {
          console.log(err)
        }
        var results = articles.slice(index, index + count)

        res.render('results', {
          keyword: q,
          currentPage: (page + 1),
          query: 'q=' + q,
          totalPage: Math.ceil(articles.length / count),
          articles: results
        })
      })
  }
}