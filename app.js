//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/toDoListDB");

const itemSchema = {
	name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
	name: "Welcome to the To-Do List."
});

const item2 = new Item({
	name: "Press + button to add a task"
});

const item3 = new Item({
	name: "<-- Use this to delete task from List."
});

const defaultItems = [item1, item2, item3];
const listSchema = {
	name: String,
	items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
	Item.find({}, function (err, foundItems) {
		res.render("list", { listTitle: "Today", newListItems: foundItems });

	});
});

app.post("/", function (req, res) {

	const data = req.body.newItem;
	const listName = req.body.list;
	const item = new Item({
		name: data
	});
	if (listName === "Today") {
		item.save();
		res.redirect("/");
	}
	else {
		List.findOne({ name: listName }, function (err, foundList) {
			if (!err) {
				foundList.items.push(item);
				foundList.save();
				res.redirect("/" + listName);
			}
		});
	}

});

app.post("/delete", function (req, res) {
	const checkedID = req.body.checkbox;
	const listName = req.body.listName;
	if (listName === "Today") {
		Item.findByIdAndRemove(checkedID, function (err) {
			if (!err) {
				res.redirect("/");
			}
		});
	}
	else {
		List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedID } } }, function (err, foundList) {
			if (!err) {
				res.redirect("/" + listName);
			}
		});
	}
});

app.get("/:titleName", function (req, res) {
	const title = _.capitalize(req.params.titleName);
	List.findOne({ name: title }, function (err, foundList) {
		if (!err) {
			if (!foundList) {
				const list = new List({
					name: title,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + title);
			}
			else {
				res.render("list", { listTitle: title, newListItems: foundList.items });
			}
		}
	});
});

app.get("/about", function (req, res) {
	res.render("about");
});

app.listen(3000, function () {
	console.log("Server started on port 3000");
});
