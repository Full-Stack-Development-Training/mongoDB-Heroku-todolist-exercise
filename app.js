//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose')
const app = express();
const _ = require('lodash')
require('dotenv').config()

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// Connect ot the local MongoDB
// mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true})

// connect to Mongo DB Atlas
mongoose.connect(`mongodb+srv://admin-marina:${process.env.DB_PASS}@cluster0.fasfn.mongodb.net/todolistDB`, {useNewUrlParser: true})

const itemsSchema = {
  name: String
}

const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist"
})

const item2 = new Item({
  name: "hit the + button to add a new item"
})

const item3 = new Item({
  name: "<-- Hit this to delete the item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model('List', listSchema)

app.get("/", function(req, res) {
  Item.find({}, (err, foundItems) => {
    if(foundItems.length === 0){
        Item.insertMany(defaultItems, (err)=> {
          if(err) {
            console.log(err)
          }else{
            console.log('Success: items added to your database')
          }
        })
        res.redirect('/')
    }else{
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName =  req.body.list
  const item = new Item ({
    name: itemName,
  })
  if(listName === 'Today') {
    item.save()
  res.redirect('/')
  }else{
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item)
      foundList.save()
      res.redirect('/' + listName)
    })
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName
  if(listName === 'Today') {
     Item.findByIdAndRemove(checkedItemId, (err) => console.log(err))
  res.redirect('/')
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items:{_id: checkedItemId}}},
      (err, foundList) => {
        if(!err) {
          res.redirect('/' + listName)
        }else{
          console.log(err)
        }
  })}
})

app.get("/:pageName", (req,res) => {
  const page = _.capitalize(req.params.pageName)

  List.findOne({name: page}, (err, foundList) => {
    if(!err) {
      if(!foundList){
        const list = new List({
          name: page,
          items: defaultItems
          })
          list.save()
          res.redirect('/' + page)
      }else{
        res.render('list', {listTitle: foundList.name, newListItems: foundList.items})
      } 
    }
    console.log(err)})
  
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
