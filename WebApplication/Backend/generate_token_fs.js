import jwt from 'jsonwebtoken';
import fs from 'fs';

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
        { expiresIn: '-1h' }
    );
    fs.writeFileSync('clean_token.txt', token, 'utf8');
    console.log("Token written to clean_token.txt");
} catch (error) {
    console.error("Error generating token:", error);
}
