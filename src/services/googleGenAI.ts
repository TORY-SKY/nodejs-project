import { GoogleGenAI, Type } from "@google/genai";
import {createTask, deleteTask, updateTask} from "../controllers/tasksController"
import { supabase } from '../services/supabaseClient';


interface ai_added_taskItem {
  completed: boolean,
  title: string,
  due_date: string

}
const apiKey = process.env.GEMINI_API_KEY; 
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });
// const ai = new GoogleGenAI({});



// defining AI executable function
const AddTaskFunctionDeclaration = {
  name: 'add_task',
  description: 'add task with specified due_date, priority: low, medium, or high. or give general text response',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'tile of tasks',
      },
      due_date: {
        type: Type.STRING,
        description: 'Due_date of the task (e.g., "2024-07-29")',
      },
    completed: {
        type: Type.BOOLEAN,
        description: 'this confirms whether the task is completed or not using boolean (true/false)',
      },
      priority: {
        type: Type.STRING,
        description: 'this determine the priority of the task either high, medium or low priority',
      },
      
    },
    required: ['title', 'due_date', 'completed', 'priority' ],
  },
};


const functionDeclarations = [AddTaskFunctionDeclaration]


  const add_Task = async (tasks: any)=>{
     const { data, error } = await supabase
      .from("tasks")
      .insert([tasks])
      .select("*")
      .single();

    // ✅ Step 4: Handle database errors
    if (error) {
      console.error("Supabase insert error:", error.message);
      return error.message
      
    }
    //  return data;
    // console.log("the task said");

    console.log(tasks)
    // console.log("the task said");


}

export async function main(prompt: string, history: []) {

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [
          {
            functionDeclarations: [AddTaskFunctionDeclaration],
          },
        ],
      },
    });

// ✅ Step 4: Check if the AI wants to call your function
if (!response.functionCalls || response.functionCalls.length === 0) {
  console.log("No function call found in the response.");
  return {
    text: response.text,
    functionCall: null,
  };
}

// ✅ Extract the first function call
const [functionCall] = response.functionCalls;

// ✅ Optional: Log the function name and arguments for debugging
// console.log(`Function to call: ${functionCall.name}`);
// console.log("Function arguments:", JSON.stringify(functionCall.args, null, 2));

if (!functionCall.args) {
  console.warn("Function call received without arguments:", functionCall);
  return ;
}

// ✅ Safely cast the arguments to the expected type
const theTask = functionCall.args as unknown as ai_added_taskItem;

// ✅ Execute the function (e.g., adding the task)
await add_Task(theTask);
return {text: `task saved successfully`};
  } catch (error) {
    // console.error("Error calling Gemini:", error);
  }

}

