﻿

namespace Common.Redis
{
    public class RedisConfig
    {
        public bool Active { set; get; }
        
        public string Connection { set; get; }
        
        public string Password { set; get; }
        
        public string ChannelPrefix { set; get; }
    }
}
