const Auth = {
    signup: async (name, email, password, address) => {
        if (auth) {
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                const userData = { id: user.uid, name, email, password, address };
                // Also save to Firestore users collection
                await db.collection('users').doc(email).set(userData);
                setCurrentUser(userData);
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        // Fallback to LocalStorage
        const users = await getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Email already registered!" };
        }
        const newUser = { id: Date.now(), name, email, password, address };
        users.push(newUser);
        await saveUsers(users);
        setCurrentUser(newUser);
        return { success: true };
    },

    login: async (email, password) => {
        if (auth) {
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                // Fetch extra data from Firestore
                const doc = await db.collection('users').doc(email).get();
                const userData = doc.exists ? doc.data() : { id: user.uid, email: user.email, name: "User" };
                setCurrentUser(userData);
                return { success: true };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        // Fallback to LocalStorage
        const users = await getUsers();
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

    googleLogin: async () => {
        if (auth) {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await auth.signInWithPopup(provider);
                const user = result.user;
                const userData = {
                    id: user.uid,
                    name: user.displayName,
                    email: user.email,
                    address: "Logged in via Google"
                };
                setCurrentUser(userData);
                return { success: true };
            } catch (error) {
                console.error("Google Auth Error:", error);
                return { success: false, message: error.message };
            }
        }

        // Fallback dummy
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
