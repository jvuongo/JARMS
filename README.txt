#####################################
#	  Test Environment	    #	
#####################################
We chose to run our application using the virtual machine option. 
The final system was run and tested on a Lubuntu 20.4.1 LTS virtual machine and on a Google Chrome browser.

Instructions to install Google Chrome for Linux:
https://linuxize.com/post/how-to-install-google-chrome-web-browser-on-ubuntu-20-04/

#####################################
#	    Submission	            #
#####################################
The codebase was submitted to WebCMS3.

Link to Github Repo: https://github.com/unsw-cse-comp3900-9900-22T1/capstone-project-3900-t12b-jarms

#####################################
#	Installation  Manual	    #
#####################################

------------------------------------
Step 1: Update Local Package Manager
------------------------------------

> sudo apt-get update

If your system doesn’t have curl, install it by entering:

> sudo apt install curl

------------------------------------
Step 2: Download Package Managers
------------------------------------

> sudo apt install npm
> sudo npm install yarn -g 

------------------------------------
Step 3: Download NodeJS
------------------------------------

> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
> source ~/.bashrc
> nvm install v14.17.3

Check that you've installed the right version of node:

> node -v
 Output should be:
 > v14.17.3
------------------------------------
Step 4: Download MongoDB
------------------------------------

> sudo apt install mongodb

Now close the terminal.
------------------------------------
Step 5: Install the dependencies.
------------------------------------
Open a new terminal.
Move into the backend directory and type the following into the terminal:

> npm install

Do npm audit fix if there are any issues.

> npm audit fix

Move into the frontend directory and type the following into the terminal:

> yarn install

------------------------------------
Step 6: Initialise the database:
------------------------------------
This step populates the database with pre-created events and dummy data.

Move into the backend directory and type the following into the terminal:

> npm run dbInit

------------------------------------
Step 7 How to run the application:
------------------------------------
Move into the backend directory and type the following into a terminal:

> npm run dev

The terminal should display the following:
INFO: App is running at http://localhost:2102
INFO: Connected to jarms db


Open a second terminal and move into the frontend directory and type the following into the terminal:

> yarn dev

The terminal should display something similar to the following:
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in 15.5s (4226 modules)

Application is ready for use

------------------------------------
How to reset the database:
------------------------------------
The application needs to be NOT running to do this.
Type the following commands in the terminal:

> mongosh
> use jarms
> db.dropDatabase()

Exit the mongo shell by Ctrl + C

Repeat Step 6
