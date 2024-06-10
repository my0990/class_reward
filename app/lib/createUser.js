const CreateUser = async (
    name,
    id,
    password,
    admin,
    teacher,
    nickname,
    gender
  ) => {

    const response = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name,  password, id, admin, teacher, nickname, gender}),
      headers: {
        "Content-Type": "application/json",
      },
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      // throw new Error(data.message || "Something went wrong!22");
      return false;
    }
  
    return data;
  }
  
  export default CreateUser;