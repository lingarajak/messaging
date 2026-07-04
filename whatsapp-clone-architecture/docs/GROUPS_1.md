# Groups
Groups stored in Redis: group:{id} -> {name, members[]}
Fan-out: chat-service reads members and emits to each online socket via Redis lookup.
Kafka consumer persists to Cassandra for history.
