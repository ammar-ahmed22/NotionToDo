import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { parseISO, format } from "date-fns";


type Todo = {
  name?: string,
  dueDate?: Date,
  type?: string[],
  class?: string[],
  for?: string,
  priority?: string
}





export const parseResults = (results: PageObjectResponse[]) => {
  const todos: Todo[] = [];
  for (let result of results) {
    const todo: Todo = {};
    const props = result.properties;
    if (props.Name.type === "title") {
      todo.name = props.Name.title.map(t => t.plain_text).join("");
    }

    if (props["Due Date"].type === "date" && props["Due Date"].date?.start) {
      todo.dueDate = parseISO(props["Due Date"].date?.start);
    }

    if (props.Type.type === "multi_select") {
      todo.type = props.Type.multi_select.map(val => val.name);
    }

    if (props.Class.type === "multi_select") {
      todo.class = props.Class.multi_select.map(val => val.name)
    }

    if (props.For.type === "select") {
      todo.for = props.For.select?.name;
    }

    if (props.Priority.type === "select") {
      todo.priority = props.Priority.select?.name;
    }

    todos.push(todo);
  }

  return todos;
}


export const constructMessage = (todos: Todo[]) => {
  let message = "To-do's for this week:\n\n";
  todos.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    return 0
  });

  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    const last = todos.length - 1;
    message += `${todo.name}\nDue: ${format(todo.dueDate ?? new Date(), "LLL do, yyy @ h:mm aaa", { timeZone: "America/Toronto"})}\nClass: ${todo.class?.join(",")}\nType: ${todo.type?.join(",")}\nFor: ${todo.for}${i !== last ? "\n\n" : ""}`
  }

  return message;
}