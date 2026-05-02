# Notification System Design

## Stage 1: API & Real-Time Setup
- **Endpoints:** We need a `GET /notifications` to fetch unread messages and a `PATCH /notifications/:id/read` to mark them as read.
- **Real-Time:** Use Server-Sent Events (SSE) so the server can push new notifications directly to the frontend without the client constantly polling.

## Stage 2: Database
- **Choice:** PostgreSQL.
- **Schema Idea:** A single `notifications` table storing `student_id`, `type`, `message`, `is_read`, and `created_at`.
- **Scaling:** To handle millions of rows, partition the table by month and move older notifications (6+ months) into cold storage like S3.

## Stage 3: Query Optimization
- **The Fix:** Add a composite index on `(studentID, isRead, createdAt DESC)`. This lets the database do a quick lookup instead of scanning the whole table.
- **Why not index everything?** Because too many indexes will severely slow down our `INSERT` performance whenever a new notification is created.

## Stage 4: Performance
- **Caching:** Put the unread count and the latest 20 notifications for active users into a Redis cache to take the load off the database.
- **Replicas:** Use database read replicas so that fetching notifications doesn't interfere with the primary database saving new ones.

## Stage 5: "Notify All" Redesign
- **The Problem:** Doing 50,000 database inserts and email sends synchronously will block the system and fail if one email crashes.
- **The Design:** Use an asynchronous message broker (like RabbitMQ). We do a fast bulk insert into the database first, then push the tasks to a background queue so worker servers can send the emails at their own pace.

## Stage 6: Priority Inbox
- **The Logic:** Score unread notifications based on type (Placement > Result > Event) and timestamp.
- **Efficiency:** Instead of sorting the whole list every time a new message arrives, we maintain a **Min-Heap (Priority Queue)** of size 10 in memory. This lets us keep track of the top 10 notifications instantly as new data streams in.
