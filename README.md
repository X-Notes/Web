# 📝 X Notes 🚀

Welcome to X Notes! Your ultimate note-taking solution. Create, edit, and organize your notes effortlessly.

## How to Use 🌐

Visit our website at [xnotes.io](https://xnotes.io) to get started right away!

## How to Install and Run Locally 🏠

### Angular Web 🅰️

Before you begin, make sure you have the following prerequisites installed:

- Node.js: v18.18.2+
- Angular CLI: 17.0.1+
- Package Manager: npm 9.8.1+

1. Open Web -> Backend -> WebAPI -> [Client](https://github.com/X-Notes/Web/tree/DEV/Backend/WebAPI/Client)
  1. Install packages run: **yarn**
  2. Run **yarn start**
  3. Open your browser and go to [localhost:4200](http://localhost:4200/)

     
### Backend .NET CORE | POSTGRESQL | Azure Storage | Redis (optional) 🖥️

Before you proceed, ensure you have the following prerequisites:

- .NET 8.0.100
- PostgreSQL
- Azure Storage (Azurite or cloud)

Here are the steps to set up the backend:

1. Open [appsettings.development.json](https://github.com/X-Notes/Web/blob/DEV/Backend/WebAPI/appsettings.Development.json)
2. Update the `DatabaseConnection` field with your database connection details.
3. If you don't have Redis, you can disable it by setting `Redis:Active` to `false`.
4. If you have your own Azure Blob Storage, update the `Azure:Storages` configuration with your values.
5. Clone the backend repository:  
5. Open Web -> [Backend](https://github.com/X-Notes/Web/tree/DEV/Backend)
6. Migrate the database using the command line:
   1. dotnet ef database update --project DatabaseContext\DatabaseContext.csproj --startup-project WebAPI\WebAPI.csproj --context DatabaseContext.ApiDbContext
   2. Or use your favorite IDE tools for database migration.
7. Run WebAPI project

## Support X Notes ☕

If you find X Notes helpful and would like to support our project, consider [buying us a coffee](https://www.buymeacoffee.com/xnotes). Your support is greatly appreciated!

## Features

## Discussion 💬
Join the conversation about X Notes on [GitHub Discussions](https://github.com/X-Notes/Web/discussions). Share your thoughts, suggestions, and feedback with the community.

## License 📜
X Notes is distributed under the AGPLv3 License. See [LICENSE.md](https://github.com/X-Notes/Web/blob/DEV/LICENSE) for more information.

🎉 Happy Note-Taking with X Notes! 📝
