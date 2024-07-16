const net = require("net");
const fs = require("fs");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

//This is how
const server = net.createServer((socket) => {
	socket.on("close", () => {
		console.log("Closing the connection");
	});
	socket.on("data", (data) => {
		const info = data.toString();
		let path = info.split("\r\n")[0].split(" ")[1];
		if (path === "/") {
			socket.write("HTTP/1.1 200 OK\r\n\r\n");
		} else if (path.startsWith("/echo")) {
			let content = path.replace("/echo/", "");
			socket.write(
				"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " +
					content.length +
					"\r\n\r\n" +
					content
			);
		} else if (path.startsWith("/user-agent")) {
			let content = info.split("\r\n")[2].replace("User-Agent: ", "");
			socket.write(
				"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: " +
					content.length +
					"\r\n\r\n" +
					content
			);
		} else if (path.startsWith("/files/")) {
			const fileName = path.replace("/files/", "").trim();
			const filePath = process.argv[3] + fileName;
			const isExist = fs.readdirSync(process.argv[3]).some((file) => {
				return file === fileName;
			});
			if (isExist) {
				const content = fs.readFileSync(filePath, "utf-8");
				socket.write(
					`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\n${content}`
				);
			} else {
				socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
			}
		} else {
			socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
		}

		console.log(path[1]);
		socket.end();
	});
});

server.listen(4221, "localhost");
