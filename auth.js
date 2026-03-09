const Auth = {
    signup: (name, email, password, address) => {
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Email already registered!" };
        }
        const newUser = { id: Date.now(), name, email, password, address };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        return { success: true };
    },

    login: (email, password) => {
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return { success: true };
        }
        return { success: false, message: "Invalid email or password!" };
    },

    isLoggedIn: () => {
        return getCurrentUser() !== null;
    },

    googleLogin: () => {
        const dummyUser = {
            id: 'google_' + Date.now(),
            name: "Google User",
            email: "faiz_user@google.com",
            address: "Logged in via Google"
        };
        setCurrentUser(dummyUser);
        return { success: true };
    }
};
