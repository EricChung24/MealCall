import {createClient} from './client';

export async function signIn(email:string,password:string){const supabase=createClient();if(!supabase) throw new Error('Supabase 環境變數尚未設定');const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;return data;}
export async function signUp(email:string,password:string){const supabase=createClient();if(!supabase) throw new Error('Supabase 環境變數尚未設定');const {data,error}=await supabase.auth.signUp({email,password});if(error)throw error;return data;}
