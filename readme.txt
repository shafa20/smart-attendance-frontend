//backend project download and setup
1.write command -> git clone https://github.com/shafa20/smart-attendance-backend-.git
2. run command ->  composer install
3.Duplicate the .env.example file and rename it to .env.
Open the .env file and set your database connection details.
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name  
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

note[here inside project in db.zip file i am attaching my db you can use that}
4.php artisan key:generate
5.php artisan migrate && php artisan db:seed (if you use my db in xampp do not need to seed beacuse so many data to insert
it may take few moments)

6. run command -> php artisan serve
7. if face any issue run this 2 command in other terminal
npm install
npm run dev


//sedding
[note if you dont want to use my database which is inside db.zip file you can run below command]
 1st run -> php artisan migrate:fresh 
 then run run command -> php artisan db:seed
* 500+ students
* 20+ instructors
* 100+ batches (each with multiple students/instructors)
* 3,000+ scheduled classes
* 150,000+ attendance records


//Frontend project download and setup
1. 1st run command -> git clone https://github.com/shafa20/smart-attendance-frontend.git
2. 2nd run command -> npm install
3. run command -> npm start

login credentials of my db
admin@gmail.com
12345678

instructor1@gmail.com
12345678

student1@gmail.com
12345678

