using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo
{
    public class MongoNoot
    {
        public ObjectId Id { set; get; }
        public string Title { set; get; }
        public string Description { set; get; }
        public List<string> Labels { set; get; }
        public string Location { set; get; }
        public string Author { set; get; }
        public DateTime Date { set; get; }
    }
}
