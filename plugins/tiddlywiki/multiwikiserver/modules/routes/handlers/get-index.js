/*\
title: $:/plugins/tiddlywiki/multiwikiserver/routes/handlers/get-index.js
type: application/javascript
module-type: mws-route

GET /?show_system=true

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.method = "GET";

exports.path = /^\/$/;

exports.handler = function(request,response,state) {
	// Get the bag and recipe information
	var bagList = $tw.mws.store.listBags(),
		recipeList = $tw.mws.store.listRecipes(),
		sqlTiddlerDatabase = state.server.sqlTiddlerDatabase;

	// If application/json is requested then this is an API request, and gets the response in JSON
	if(request.headers.accept && request.headers.accept.indexOf("application/json") !== -1) {
		state.sendResponse(200,{"Content-Type": "application/json"},JSON.stringify(recipes),"utf8");
	} else {
		// This is not a JSON API request, we should return the raw tiddler content
		response.writeHead(200, "OK",{
			"Content-Type":  "text/html"
		});
		// filter bags and recipies by user's read access from ACL
		var allowedRecipes = recipeList.filter(recipe => sqlTiddlerDatabase.hasRecipePermission(state.authenticatedUser?.user_id, recipe.recipe_name, 'READ') || state.allowAnonReads);
    var allowedBags = bagList.filter(bag => sqlTiddlerDatabase.hasBagPermission(state.authenticatedUser?.user_id, bag.bag_name, 'READ') || state.allowAnonReads);

		// Render the html
		var html = $tw.mws.store.adminWiki.renderTiddler("text/plain","$:/plugins/tiddlywiki/multiwikiserver/templates/page",{
			variables: {
				"show-system": state.queryParameters.show_system || "off",
				"page-content": "$:/plugins/tiddlywiki/multiwikiserver/templates/get-index",
				"bag-list": JSON.stringify(allowedBags),
				"recipe-list": JSON.stringify(allowedRecipes),
				"username": state.authenticatedUser ? state.authenticatedUser.username : state.firstGuestUser ? "Annonymous User" : "Guest",
				"user-is-admin": state.authenticatedUser && state.authenticatedUser.isAdmin ? "yes" : "no",
				"first-guest-user": state.firstGuestUser ? "yes" : "no",
				"show-annon-config": state.showAnonConfig ? "yes" : "no",
				"user": JSON.stringify(state.authenticatedUser),
			}});
		response.write(html);
		response.end();
	}
};

}());
