using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo
{
    public class User
    {
        public ObjectId Id { set; get; }
        public string Name { set; get; }
        public string Email { set; get; }
        public string PhotoId { set; get; }
        public List<Background> BackgroundsId { set; get; }
        public Background CurrentBackgroundId { set; get; }
    }
}
