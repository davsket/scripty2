/** section: Effects
 *  class s2.fx.Queue
 *
 *  Effect queues manage the execution of effects in parallel or 
 *  end-to-end over time.
**/
s2.fx.Queue = (function(){ 
  return function(){
    var effects = [];
    
    /**
     *  s2.fx.Queue#getEffects() -> Array
     *
     *  Returns an array of any effects currently running or queued up.
    **/
    function getEffects(){
      return effects;
    }
    
    /**
     *  s2.fx.Queue#active() -> Boolean
     *
     *  Returns whether there are any effects currently running or queued up.
    **/
    function active(){
      return effects.length > 0;
    }
    
    /**
     *  s2.fx.Queue#add(effect) -> s2.fx.Queue
     *  - effect (s2.fx.Base): Effect to be queued
     *
     *  Add an effect to the queue. The effects' options can optionally
     *  contain a `position` option that can be either `parallel` 
     *  (the effect will start immediately) or 
     *  `end` (the effect will start when the last of the 
     *  currently queued effects end).
     *  Returns the Queue.
     *
     *  fires: effect:queued
    **/
    function add(effect){
      calculateTiming(effect);
      effects.push(effect);
      document.fire('effect:queued', this);
      return this;
    }

    /**
     *  s2.fx.Queue#remove(effect) -> s2.fx.Queue
     *  - effect (s2.fx.Base): Effect to be removed from the Queue.
     *
     *  Removes an effect from the Queue and destroys the effect.
     *  Returns the Queue.
     *
     *  fires: effect:dequeued
    **/
    function remove(effect){
      effects = effects.without(effect);
      delete effect;
      document.fire('effect:dequeued', this);
      return this;
    }

    /**
     *  s2.fx.Queue#render(timestamp) -> s2.fx.Queue
     *  - timestamp (Date): Timestamp given to the individual effects' render methods.
     *
     *  Renders all effects that are currently in the Queue.
     *  Returns the Queue.
    **/
    function render(timestamp){
      effects.invoke('render', timestamp);
      effects.select(function(effect) {
        return effect.state == 'finished';
      }).each(remove);
      return this;
    }

    function calculateTiming(effect){
      var position = effect.options.position || 'parallel',
        startsAt = s2.fx.getHeartbeat().getTimestamp();

      if (position == 'end')
        startsAt = effects.without(effect).pluck('endsAt').max() || startsAt;

      effect.startsAt = 
        startsAt + (effect.options.delay || 0) * 1000;
      effect.endsAt = 
        effect.startsAt + (effect.options.duration || 1) * 1000;
    }
    
    Object.extend(this, {
      getEffects: getEffects,
      active: active,
      add: add,
      remove: remove,
      render: render
    });
  }
})();