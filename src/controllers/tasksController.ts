// src/controllers/tasksController.ts

import { Response, Request, NextFunction } from "express";
import { supabase } from '../services/supabaseClient'; // Corrected import path assumed
import {Task} from "../models/tasks";
import {main} from "../services/googleGenAI"

// import { Task } from "../models/tasks"; // Assuming you have a Task interface

// 1. FIX: Correct the function signature from (res, req) to (req, res)
// 2. Add NextFunction for proper Express error handling
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // FIX: Ensure 'Task' is not inside the .from() generic if it caused TS2558 error
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: true });



           

        // 500 ERROR CHECK: If Supabase returns an error, catch it and pass it to Express error middleware
        if (error) {
            // Log the detailed error on the server side
            console.error('Supabase Error:', error.message); 
            
            // Pass the error to the Express error handler (instead of manually responding with 500 here)
            // This is generally cleaner and recommended for middleware.
            return next(new Error(`Database Query Failed: ${error.message}`));
        }

        // Return the data if successful
        return res.json(data);

    } catch (err) {
        // Catches any exceptions thrown by await, like a bad connection
        console.error("Uncaught Error in getTasks:", err);
        next(err); // Passes any unexpected error to the Express error handler
    }
};

// create task function


export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, priority, due_date } = req.body as Partial<Task>;

    // ✅ Step 1: Validate inputs
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid title" });
    }

    // ✅ Step 2: Prepare the data to insert
    const newTask = {
      title: title.trim(),
      priority: priority ?? 0, // if no priority given, default to 0
      // due_date: due_date ?? null, // optional field
    };

    // ✅ Step 3: Insert into Supabase
    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select("*")
      .single();

    // ✅ Step 4: Handle database errors
    if (error) {
      console.error("Supabase insert error:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to create task. Please try again later." });
    }

    // ✅ Step 5: Success response
    return res.status(201).json({
      message: "Task created successfully",
      task: data,
    });
  } catch (err) {
    // ✅ Step 6: Catch unexpected errors
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};


// delete task function
export const deleteTask = async (req: Request, res: Response)=>{
    const {id} = req.params;
    if(!id || typeof id !== "string"){
        return res.status(400).json({error: "Invalid or missing task Id, check again bro, or hire a good developer like me"});

    }
    // line that deletes the data with matching id 
    const {error} = await supabase.from("tasks").delete().eq("id", id);
    if(error){
        console.log(error.message);
        return res.status(500).json({error: "Internal server error"});
    }

    return res.status(200).json({message: `Task ${id} deleted successfully `});
};

// edit task function
export const updateTask = async (req: Request, res: Response)=>{
    try{
        const {id} = req.params;

    const {title, priority, completed} = req.body;
    console.log(title);
    console.log(priority);
    if(!id || typeof id !== "string"){
      return  res.status(400).json({error: "In valid or missing Id, and if you're trying to hack me, God sees you"});

    }
    // this part ensures that the payload sent from the frontend, at least one is edited
    if(title === undefined && priority === undefined && completed === undefined){
        return res.status(400).json({error: "No field provided for update"});
    }
    // this part checks which of the filed was editted and updates only that part
    const update: Partial<Task> = {};
    if(title !== undefined) update.title = title;
    if(priority !== undefined) update.priority = priority;
    if(completed !== undefined) update.completed = completed;

    // supabase fn to update the row in the database
    const {data, error} = await supabase.
    from("tasks")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
    console.log(title);
    console.log(priority);
    if(error){
        console.log("Victor the error is coming from here");
        // remember to update this for security reasons cause error.message can log sensitive data to the client side
        return res.status(500).json({error: error.message});
    }
    return res.status(200).json({
        message: "Task updated successfully", 
        updatedTask: data,
    });
    }catch(error){
        console.error("Server error:", error);
    return res.status(500).json({ error: "Server error. Please try again." });
    }
    
}

// this part is where ai handles the crud
export const AI_createTask = async (req: Request, res: Response) => {
  try {
    const {history, prompt} = req.body;

    // ✅ Step 1: Validate inputs
    if (!prompt) {
      return res.status(400).json({ error: "Invalid prompt" });
    }
    const gemini_response = await main(prompt);
    console.log(gemini_response);
    console.log(`the AI response to your prompt is ${gemini_response}`);
    console.log(gemini_response);


    // ✅ Step 2: Prepare the data to insert
    // const newTask = {
    //   title: title.trim(),
    //   priority: priority ?? 0, // if no priority given, default to 0
    //   // due_date: due_date ?? null, // optional field
    // };

    // ✅ Step 3: Insert into Supabase
    // const { data, error } = await supabase
    //   .from("tasks")
    //   .insert()
    //   .select("*")
    //   .single();

    // ✅ Step 4: Handle database errors
    // if (error) {
    //   console.error("Supabase insert error:", error.message);
    //   return res
    //     .status(500)
    //     .json({ error: "Failed to create task. Please try again later." });
    // }

    // ✅ Step 5: Success response
    return res.status(201).json({
      message: "prompt received",
      ai: gemini_response,
    });
  } catch (err) {
    // ✅ Step 6: Catch unexpected errors
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};



