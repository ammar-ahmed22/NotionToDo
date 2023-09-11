import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz"


type Todo = {
  name?: string,
  dueDate?: Date,
  type?: string[],
  class?: string[],
  for?: string,
  priority?: string,
  deliverable?: boolean
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

    if (props.Deliverable.type === "checkbox") {
      todo.deliverable = props.Deliverable.checkbox.valueOf();
    }

    todos.push(todo);
  }

  return todos;
}

const sortTodos = (todos: Todo[]) => {
  todos.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  })
}

const createMessageEntry = (todo: Todo, last: boolean = false) => {
  const tz = "America/Toronto";
  const date = todo.dueDate ? utcToZonedTime(todo.dueDate, tz) : new Date();
  return `${todo.name}\nDue: ${format(date, "EEEE LLL. do, yyy @ h:mm aaa")}\nClass: ${todo.class?.join(",")}\nType: ${todo.type?.join(",")}\nFor: ${todo.for}${last ? "" : "\n\n"}`
}

export const constructMessage = (todos: Todo[]) => {
  let message = "✅ To-do's for this week:\n\n";
  const deliverables = todos.filter(t => t.deliverable);
  const nonDeliverables = todos.filter(t => !t.deliverable);

  sortTodos(deliverables);
  sortTodos(nonDeliverables);
  
  message += "📝 Deliverables:\n"
  deliverables.forEach((t, i) => {
    message += createMessageEntry(t);
  })

  message += "🔔 Non-Deliverables:\n"
  nonDeliverables.forEach((t, i) => {
    message += createMessageEntry(t, i === nonDeliverables.length - 1);
  })

  return message;
}