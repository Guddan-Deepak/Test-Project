import jwt from 'jsonwebtoken';

const secret = "f3Y6puROpIoK8YmSDd579MvMksQPktWeQpXWMQeHzWgHhR0kFwX7QjLFqMrGwOrS";
const userPayload = {
    id: "693413bdfa30479061aec3ef",
    role: "analyst",
    email: "ashwin@gmail.com"
};

try {
    const token = jwt.sign(
        userPayload,
        secret,
        { expiresIn: '-1h' } // Expired 1 hour ago
    );
    console.log(token);
} catch (error) {
    console.error("Error generating token:", error);
}
