function Profile() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

      <div className="bg-slate-900 p-10 rounded-xl">

        <h1 className="text-3xl mb-4">User Profile</h1>

        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>

      </div>

    </div>
  );
}

export default Profile;