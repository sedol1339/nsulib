'use strict';

var Controller = function Controller(view, model) {
	this.view = view;
	this.model = model;
};

Controller.prototype.initialize = function initialize() {
	checkpoint();
};

var View = function View() {
	
};

View.prototype.initialize = function initialize() {
  checkpoint();
};

var Model = function Model() {
  
};

Model.prototype.initialize = function initialize() {
  checkpoint();
};

$(document).ready( function(){
	var model = new Model();
	model.initialize();
	var view = new View();
	view.initialize();
	var controller = new Controller(view, model);
	controller.initialize();
});