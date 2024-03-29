const CreateUser = async (
    name,
    id,
    password,
    admin,
    teacher
  ) => {
    const response = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name,  password, id, admin, teacher}),
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || "Something went wrong!");
    }
  
    return data;
  }
  
  export default CreateUser;