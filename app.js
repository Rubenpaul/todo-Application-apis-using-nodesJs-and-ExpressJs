const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { format } = require("date-fns");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriority = (requestObj) => {
  return requestObj.priority !== undefined;
};
const hasStatus = (requestObj) => {
  return requestObj.status !== undefined;
};
const hasCategory = (requestObj) => {
  return requestObj.category !== undefined;
};
const hasSearchQuery = (requestObj) => {
  return requestObj.search_q !== undefined;
};
const hasStatusAndPriority = (requestObj) => {
  return requestObj.status !== undefined && requestObj.priority !== undefined;
};
const hasCategoryAndStatus = (requestObj) => {
  return requestObj.status !== undefined && requestObj.category !== undefined;
};
const hasCategoryAndPriority = (requestObj) => {
  return requestObj.category !== undefined && requestObj.priority !== undefined;
};

//ADD GET Todos API
app.get("/todos/", async (request, response) => {
  const { priority, status, category, due_date, search_q } = request.query;

  let isStatusChecked =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  let isPriorityChecked =
    priority === "HIGH" || priority === "LOW" || priority === "MEDIUM";
  let isCategoryChecked =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  switch (true) {
    case hasStatusAndPriority(request.query):
      if (isStatusChecked && isPriorityChecked) {
        const selectStatusQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  status = "${status}" AND priority = "${priority}"
        `;
        const result = await db.all(selectStatusQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid");
      }
      break;

    case hasCategoryAndStatus(request.query):
      if (isCategoryChecked && isStatusChecked) {
        const selectStatusQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  status = "${status}" AND category = "${category}"
        `;
        const result = await db.all(selectStatusQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid");
      }
      break;

    case hasCategoryAndPriority(request.query):
      if (isCategoryChecked && isPriorityChecked) {
        const selectStatusQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  priority = "${priority}" AND category = "${category}"
        `;
        const result = await db.all(selectStatusQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid");
      }
      break;

    case hasPriority(request.query):
      if (isPriorityChecked) {
        const selectPriorityQuery = `
          SELECT
              *
          FROM
              todo
          WHERE
              priority = "${priority}"
    `;
        const result = await db.all(selectPriorityQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasStatus(request.query):
      if (isStatusChecked) {
        const selectStatusQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  status = "${status}"
        `;
        const result = await db.all(selectStatusQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasCategory(request.query):
      if (isCategoryChecked) {
        const selectStatusQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  category = "${category}"
        `;
        const result = await db.all(selectStatusQuery);
        response.send(result);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasSearchQuery(request.query):
      const selectSearchQuery = `
          SELECT
              *
          FROM
              todo
          WHERE
              todo LIKE "%${search_q}%"
    `;
      const result = await db.all(selectSearchQuery);
      response.send(result);
      break;

    default:
      const searchQuery = `
          SELECT * FROM todo;
        `;
      const todoList = await db.all(searchQuery);
      response.send(todoList);
      break;
  }
});

const convertDbObjToResponseObj = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    priority: dbObj.priority,
    status: dbObj.status,
    category: dbObj.category,
    dueDate: dbObj.due_date,
  };
};

//ADD GET Todo API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
        SELECT 
            * 
        FROM 
            todo 
        WHERE
            id = ${todoId}
    `;
  const TodoObj = await db.get(getTodoQuery);
  const Todo = convertDbObjToResponseObj(TodoObj);
  response.send(Todo);
});

//ADD GET List OF Todos Of Specific Date
const hasDate = (requestObj) => {
  return requestObj.date !== undefined;
};

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const result = date.split("-");
  const year = parseInt(result[0]);
  const month = parseInt(result[1]) - 1;
  const day = parseInt(result[2]);

  if (hasDate(request.query)) {
    const newDate = format(new Date(2021, 1, 21), "yyyy-MM-dd");
    const valid = isValid(new Date(year, month, day));
    const TodoListForDateQuery = `
        SELECT * FROM todo WHERE due_date =  ${newDate}  
    `;

    let TodoList = [];
    const TodoObjArray = await db.all(TodoListForDateQuery);
    for (let todo of TodoObjArray) {
      TodoList.push(convertDbObjToResponseObj(Todo));
    }
    console.log(TodoObjArray);
    response.send(TodoList);
  }
});
