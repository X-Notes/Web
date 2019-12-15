using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.Domain.Mongo
{
    public class Label
    {
        public ObjectId Id { set; get; }
        public ObjectId UserId { get; set; }
        public string Name { set; get; }
        public string Color { set; get; }
    }
}
