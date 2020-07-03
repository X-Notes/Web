using System;
using System.Collections.Generic;
using System.Text;

namespace WriteContext.Repositories
{
    public class UserRepository
    {
        private readonly WriteContextDB contextDB;

        public UserRepository(WriteContextDB contextDB)
        {
            this.contextDB = contextDB;
        }


    }
}
