cooking a modern lightweight saas boilerplate 

# run the project

## frontend

```bash
 cd frontend
 bun (or any other package manager) install
 bun build
 bun build:css
 (optional) bun run watch:css
 bun (only bun here ^^ cuz the server use bun) start
 
```

and the frontend will be served at http://localhost:3000 (but you can set the port at the top of the `server.ts` file)
