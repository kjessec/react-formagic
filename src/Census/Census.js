import React from 'react';
import { pure } from 'recompose';

export default pure(function App(props) {
  const { people } = props.formagic;

  return (
    <div>
    {people.map(person =>
      <fieldset key={person.guid}>
        <legend>{person.guid}</legend>
        <About person={person}/>
        <Email person={person}/>
        <Age person={person}/>
        <FriendsGroup person={person}/>
      </fieldset>)
    }
    </div>
  )
});

export const About = pure(function About({ person }) {
  const { about } = person;
  return (
    <div>
      About:
      <textarea
        value={about}
        onChange={ev => { person.about = ev.target.value; }}
      />
    </div>
  )
});

export const Email = pure(function Email({ person }) {
  const { email } = person;
  return (
    <div>
      Email:
      <input
        type="text"
        value={email}
        onChange={ev => { person.email = ev.target.value; }}/>
    </div>
  )
});

export const Age = pure(function Age({ person }) {
  const { age } = person;
  return (
    <div>
      <input
        type="number"
        value={age}
        onChange={ev => { person.age = ~~ev.target.value; }}/>
    </div>
  )
});

export const FriendsGroup = pure(function FriendsGroup({ person }) {
  const { friends } = person;
  return (
    <fieldset>
      <legend>Friends</legend>
      {friends.map(friend => <div key={friend.id}>
        <p>{friend.name}</p>
        {friend.posessions.map((posession, idx) => <Posession key={`p${idx}`} idx={idx} posession={posession}/>)}
      </div>)}
    </fieldset>
  );
});

export const Posession = pure(function Posession({ posession, idx }) {
  const { type, size, attributes } = posession;
  return (
    <fieldset>
      <legend>posession {idx+1}</legend>
      type <input type="text" value={type} onChange={ev => { posession.type = ev.target.value}}/>
      size <input type="number" value={size} onChange={ev => { posession.size = ~~ev.target.value}}/>
      <fieldset>
        <legend>Attributes</legend>
        <div>
          color
          <input type="text" value={attributes.color} onChange={ev => { attributes.color = ev.target.value}}/>
        </div>
        <div>
          isMovable
          <input type="checkbox" value={attributes.isMovable} onChange={ev => { attributes.isMovable = ev.target.value}}/>
        </div>
        <div>
          description
          <textarea value={attributes.description} onChange={ev => { attributes.description = ev.target.value}}/>
        </div>
      </fieldset>
    </fieldset>
  )
});
