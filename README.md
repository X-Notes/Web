# X Notes
## How to use
Open https://xnotes.io and use
## How to install and run locally
### Angular Web
Prerequisites: Node: v18.18.2+, Angular CLI: 17.0.1+, Package Manager: npm 9.8.1+
1. Open Web -> Backend -> WebAPI -> [Client](https://github.com/X-Notes/Web/tree/DEV/Backend/WebAPI/Client)
  1.1 Install packages run: **yarn**
  1.2 Run project **yarn start**
  1.3 Open project [localhost:4200](http://localhost:4200/)
### Backend .NET CORE | POSTGRESQL | Azure Storage | Redis(not necessary)
Prerequisites: .NET 8.0.100, Postgresql, Azure Storage(Azurite or cloud)
1. Open [appsettings.development.json](https://github.com/X-Notes/Web/blob/DEV/Backend/WebAPI/appsettings.Development.json)
2. Update DatabaseConnection field with your value.
3. if you don't have redis, you need to disable Redis:Active set false.
4. if you have own azure blob storage update Azure:Storages with your values.  
5. Open Web -> [Backend](https://github.com/X-Notes/Web/tree/DEV/Backend)
6. Migrate Database:
   1. dotnet ef database update --project DatabaseContext\DatabaseContext.csproj --startup-project WebAPI\WebAPI.csproj --context DatabaseContext.ApiDbContext
   2. or use IDE tools for migration
7. Run WebAPI
## Support X Notes
-   Support X Notes on  [Buy Me a Coffee](https://www.buymeacoffee.com/xnotes)
## Features
## Discussion
-   Discuss X Notes on  [GitHub Discussions](https://github.com/X-Notes/Web/discussions)
## License
- Distributed under the AGPLv3 License. See [LICENSE.md](https://github.com/X-Notes/Web/blob/DEV/LICENSE) for more information.
