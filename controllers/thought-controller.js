const { User, Thought} = require('../models');

const thoughtController = {
  // get all Thoughts
  getAllThought(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  // get one Thought by id
  getThoughtById({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: 'reactions',
        select: '-__v'
      })
      .select('-__v')
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No Thought found with this id!' });
          return;
        } 
        res.json(dbThoughtData);
      })
      .catch(err => {
        console.log(err);
        res.sendStatus(400);
      });
  },

  // createThought
  createThought({ params, body }, res) {
    Thought.create(body)
        .then(({ _id}) => {
            return User.findOneAndUpdate(
                { username: body.username },
                { $push: { thoughts: _id } },
                { new: true }
            );
        })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this username!'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => res.json(err));
  },

  // update Thought by id
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No Thought found with this id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.json(err));
  },

  // delete Thought
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No Thought found with this id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.json(err));
  },

  //create reaction
  createReaction({params, body}, res) {
    Thought.findOneAndUpdate(
      {_id: params.thoughtId}, 
      {$push: {reactions: body}}, 
      {new: true, runValidators: true})
    .populate({
      path: 'reactions', 
      select: '-__v'
    })
    .select('-__v')
    .then(dbThoughtData => {
        if (!dbThoughtData) {
            res.status(404).json({message: 'No thoughts with this ID.'});
            return;
        }
        res.json(dbThoughtData);
    })
    .catch(err => res.status(400).json(err))
  },
  // createReaction({ params, body }, res) {
  //   Thought.findOneAndUpdate(
  //     { _id: params.thoughtId },
  //     { $push: { reactions: body } },
  //     { new: true, runValidators: true }
  //   )
  //     .then(dbThoughtData => {
  //       if (!dbThoughtData) {
  //         res.status(404).json({ message: 'No thought found with this id!' });
  //         return;
  //       }
  //       res.json(dbThoughtData);
  //     })
  //     .catch(err => res.json(err));
  // },

  //delete reaction
  deleteReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: params.reactionID } },
      { new: true }
    )
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.json(err));
  }
};


module.exports = thoughtController
