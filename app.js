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

const hasTodo = (requestObj) => {
  return requestObj.todo !== undefined;
};

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
        const selectStatusAndPriorityQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  status = "${status}" AND priority = "${priority}"

        `;

        const resultList1 = [];
        const resultObjList1 = await db.all(selectStatusAndPriorityQuery);
        for (let result of resultObjList1) {
          resultList1.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList1);
      } else {
        response.status(400);
        response.send("Invalid");
      }
      break;

    case hasCategoryAndStatus(request.query):
      if (isCategoryChecked && isStatusChecked) {
        const selectStatusAndCategoryQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  status = "${status}" AND category = "${category}"
        `;
        const resultList2 = [];
        const resultObjList2 = await db.all(selectStatusAndCategoryQuery);
        for (let result of resultObjList2) {
          resultList2.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList2);
      } else {
        response.status(400);
        response.send("Invalid");
      }
      break;

    case hasCategoryAndPriority(request.query):
      if (isCategoryChecked && isPriorityChecked) {
        const selectCategoryAndPriorityQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  priority = "${priority}" AND category = "${category}"
        `;
        const resultList3 = [];
        const resultObjList3 = await db.all(selectCategoryAndPriorityQuery);
        for (let result of resultObjList3) {
          resultList3.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList3);
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
        const resultList4 = [];
        const resultObjList4 = await db.all(selectPriorityQuery);
        for (let result of resultObjList4) {
          resultList4.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList4);
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
        const resultList5 = [];
        const resultObjList5 = await db.all(selectStatusQuery);
        for (let result of resultObjList5) {
          resultList5.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList5);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasCategory(request.query):
      if (isCategoryChecked) {
        const selectCategoryQuery = `
              SELECT
                  *
              FROM
                  todo
              WHERE
                  category = "${category}"
        `;
        const resultList6 = [];
        const resultObjList6 = await db.all(selectCategoryQuery);
        for (let result of resultObjList6) {
          resultList6.push(convertDbObjToResponseObj(result));
        }
        response.send(resultList6);
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
      const resultList7 = [];
      const resultObjList7 = await db.all(selectSearchQuery);
      for (let result of resultObjList7) {
        resultList7.push(convertDbObjToResponseObj(result));
      }
      response.send(resultList7);
      break;

    default:
      const searchQuery = `
          SELECT * FROM todo;
        `;
      const resultList8 = [];
      const resultObjList8 = await db.all(searchQuery);
      for (let result of resultObjList8) {
        resultList8.push(convertDbObjToResponseObj(result));
      }
      response.send(resultList8);
      break;
  }
});

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

  if (hasDate(request.query)) {
    const isValidDate = isValid(new Date(date));
    if (isValidDate) {
      const formattedDate = format(new Date(date), "yyyy-MM-dd");
      const getTodoDateQuery = `
        SELECT 
            * 
        FROM 
            todo 
        WHERE 
            due_date = "${formattedDate}"
      `;

      let finalListOfObj = [];
      const resultObj = await db.all(getTodoDateQuery);
      for (let result of resultObj) {
        finalListOfObj.push(convertDbObjToResponseObj(result));
      }
      response.send(finalListOfObj);
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

// POST todo API

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  let isStatusChecked =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  let isPriorityChecked =
    priority === "HIGH" || priority === "LOW" || priority === "MEDIUM";
  let isCategoryChecked =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  const hasDueDate = (requestObj) => {
    return requestObj.dueDate !== undefined;
  };

  const isValidDates = isValid(new Date(dueDate));

  if (hasStatus(request.body)) {
    if (isStatusChecked === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  if (hasPriority(request.body)) {
    if (isPriorityChecked === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }

  if (hasCategory(request.body)) {
    if (isCategoryChecked === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }

  if (hasDueDate(request.body)) {
    if (isValidDates === false) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }

  if (
    isPriorityChecked &&
    isCategoryChecked &&
    isStatusChecked &&
    isValidDates
  ) {
    const date = format(new Date(dueDate), "yyyy-MM-dd");
    const createTodoQuery = `
            INSERT INTO todo (id, todo, priority, status, category, due_date)
        VALUES
            (${id}, "${todo}", "${priority}", "${status}", "${category}", "${date}")
        `;
    await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  }
});

// UPDATE API for a specific todo

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, category, todo, dueDate } = request.body;

  let isStatusChecked =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  let isPriorityChecked =
    priority === "HIGH" || priority === "LOW" || priority === "MEDIUM";
  let isCategoryChecked =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  const hasDueDate = (requestObj) => {
    return requestObj.dueDate !== undefined;
  };
  switch (true) {
    case hasStatus(request.body):
      if (isStatusChecked) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
            status = "${status}"
        WHERE 
            id = ${todoId}
    `;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(request.body):
      if (isPriorityChecked) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
            priority = "${priority}"
        WHERE 
            id = ${todoId}
    `;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategory(request.body):
      if (isCategoryChecked) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
            category = "${category}"
        WHERE 
            id = ${todoId}
    `;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasTodo(request.body):
      const updateTodoQuery = `
        UPDATE todo 
        SET 
            todo = "${todo}"
        WHERE 
            id = ${todoId}
    `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    case hasDueDate(request.body):
      const isValidDate = isValid(new Date(dueDate));
      if (isValidDate) {
        const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
        const updateTodoQuery = `
                UPDATE 
                    todo 
                SET 
                    due_date = "${formattedDate}"
                WHERE 
                    id = ${todoId}
        `;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

// DELETE a Todo
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM 
            todo 
        WHERE 
            id = ${todoId}
    `;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
