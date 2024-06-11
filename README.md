# Recipes-Master





This project is a recipe application that allows users to browse and manage their favorite recipes. It has multiple features including multiple routes, reusable components, inter-component communication, public and private routes, and multiple forms.

## Routes
The application has multiple routes including:
1. Home route: displays a summary of all recipes
2. Recipes route: displays a list of all recipes in cards
3. Dynamic routes for each recipe: displays detailed information about a specific recipe
4. Create recipe page: allows users to create new recipes and save them to the server

## Reusable Components
The project uses reusable components, with the recipe cards being the most notable example. The recipe cards display a brief summary of each recipe and allow users to view more detailed information about a specific recipe.

## Inter-Component Communication
The components in this project communicate with each other in several ways. For example, the recipe service is used to fetch data from the server and insert it into each recipe card. When a user clicks on the image of a recipe card, an event is sent from the card to the recipe component, which opens the dynamic route of the recipe.

## Public and Private Routes
The application has both public and private routes. The only private route is the create-recipe page, which is protected by an auth guard to ensure that only authenticated users can access it.

## Forms
The project has multiple forms including a login / register form, a create-recipe form, and an edit-recipe form. These forms allow users to interact with the application and manage their recipes.

## Backend
The project uses Firebase for its backend, which includes authentication, data storage, and hosting.


