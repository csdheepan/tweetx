# Angular 16 Firebase TweetX-18 Application

## Project Overview:
This Angular 16 application uses Google Firebase on the backend and is like a social media platform inspired by Twitter. You can sign up, log in, share posts, follow friends, and see what others are posting

## Tech Stack:
- Frontend: Angular 16
- Backend: Google Firebase (Firestore Database)
- Hosting : Google Firebase


## Project Structure:
The project is structured with the following modules:

- Root Module : This is the main module of the Angular application, serving as the entry point and orchestrating the loading of other modules.

-Angular Material Module : This module likely contains imports and configurations related to Angular Material, a UI component library for Angular applications.

- Core
    - Service: : It contains service files. Services typically handle data access, business logic, and other non-UI related tasks
    - Model: It contains data model files. These are classes or interfaces that represent the structure of data used within the application.

-login
  --login component : login component responsible for rendering the login interface and handling user authentication

- Profile Module (contains all components required for the application) :  This module is dedicated to functionalities related to profile,user and feed post. It includes components and services required for managing and displaying user profiles.


- shared Module

  --components: It contains shared components that can be reused throughout the application.
     ---page-not-found : This component is responsible for displaying a "Page Not Found" message when a user navigates to a URL that does not exist within the application. It ensures a user-friendly experience by informing users about invalid routes.
      
  --service : It contains shared services that provide common functionality needed across different parts of the application.

-assets
  --Images :  Stores all images used in the application.

-environment
  --environment.ts- It contains Firebase authentication details

## Setup and Installation:
1. Clone the repository using the command 👉🏻 git clone https://github.com/csdheepan/tweetx.git

2. Verify Node.js and npm installation using the command node -v , npm -v :
- Node version: v18.19.0
- Npm version: 10.2.3
3. Navigate to the project directory.
4. Run `npm install` command to install the dependencies.
5. Run the application using `ng serve`.
6. The application is now running successfully on localhost. Please check your browser.

## Hosted Website:
The application is hosted on Google Firebase.

Link: [https://tweet-x-18.web.app](https://tweet-x-18.web.app)

## Functionality:
- **Sign Up and Login:** Users can create accounts and log in.
- **Posting Feed:** Users can share posts with the community.
- **Following Friends:** Users can follow and stay updated on posts from friends.
- **Avatar Customization:** Provide users the ability to change their avatars.
- **Responsive Design:** The application is fully responsive for a seamless user experience.
- **Preview the diagram for better understanding:** ![Application Functionality Diagram](src/assets/images/application-diagram.jpg)

## Future Improvements:
- **Direct Messaging:** Allow users to send messages to each other.
- **Additional features and enhancements for an enriched user experience.

## Database:
The application utilizes Google Firestore Database for efficient data storage and retrieval.

## Database Design:
![firestore database design diagram](src/assets/images/database-design.jpg)


## Contact Information:
For any questions or further information, feel free to contact:

- **Name:** Dheepan S
- **Email:** csdheepan18@gmail.com
- **Website:** [dheepanportfolio.in](https://dheepanportfolio.in)
