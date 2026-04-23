import { Learning } from "../models/learning.js";

export const getLearning = async (req, res) => {
  const studentId = req.user._id;

  let learning = await Learning.findOne({ student: studentId });

  if (!learning) {
    learning = await Learning.create({
      student: studentId,
      topics: [
        { title: "React Basics" },
        { title: "Redux Toolkit" },
        { title: "Node.js API" },
      ],
    });
  }

  res.json({ success: true, learning });
};

export const markTopicComplete = async (req, res) => {
  const { topicId } = req.params;
  const studentId = req.user._id;

  const learning = await Learning.findOne({ student: studentId });

  const topic = learning.topics.id(topicId);

  if (!topic) {
    return res.status(404).json({ message: "Topic not found" });
  }

  topic.status = "completed";
  topic.completedAt = new Date();

  const total = learning.topics.length;
  const done = learning.topics.filter((t) => t.status === "completed").length;

  learning.progress = Math.round((done / total) * 100);

  await learning.save();

  res.json({ success: true, learning });
};
