var extend = require('backbone/node_modules/underscore').extend;
var Collection = require('./collection.js');
var TrackListTrack = require('../model/track_list_track.js');
var TrackListCollection = Collection.extend({
  model: TrackListTrack,
  _resyncCounter: 0,
  _prepareModel: function (attrs, options) {
    var opts = extend({}, options, { mopidy: this.mopidy });
    return Collection.prototype._prepareModel.call(this, attrs, opts);
  },
  initialize: function (models, options) {
    Collection.prototype.initialize.apply(this, arguments);
    this.listenTo(this.mopidy, 'event:tracklistChanged', this.fetch);
  },
  move: function (model, toIndex) {
    var modelIndex = this.indexOf(model);
    Collection.prototype.move.apply(this, arguments);
    this.mopidy.tracklist.move(modelIndex, modelIndex + 1, toIndex).then(null, Collection.prototype.move.bind(this, model, modelIndex));
  },
  sync: function (method, collection, options) {
    var xhr = this.mopidy.tracklist.getTlTracks();

    function tlTracksSuccess(resp) {
      options.success(resp);
    }

    this.mopidy.playback.getCurrentTlTrack().then(function (track) {
      track = track || {};
      options.activeTlid = track.tlid;
      xhr.then(tlTracksSuccess);
    });

    return xhr;
  },
  current: function() {
    return this.filter(function (tlTrack) {
      return tlTrack.current;
    })[0];
  }
});

module.exports = TrackListCollection;
