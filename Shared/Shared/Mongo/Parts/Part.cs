using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo.Parts
{
    public class Part
    {
        public ObjectId Id { set; get; }
        public string Type { set; get; }
    }
}
