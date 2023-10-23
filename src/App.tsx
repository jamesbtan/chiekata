import type { Component } from 'solid-js';
import { createSignal, createResource, Show } from 'solid-js';

const App: Component = (props) => {
  let [adding, setAdding] = createSignal(false);
  let [sentence, setSentence] = createSignal(null);

  const getSentence = async () => {
    const tx = props.db.transaction('notes', 'readonly');
    const cursor = await tx.store.index('rev').openCursor();
    while (cursor) {
      setSentence(cursor.value);
      break;
    }
    return sentence();
  };

  const [data, { refetch } ] = createResource(getSentence);

  const toISODate = (d) => d.toISOString().split('T')[0];

  const addCard = async () => {
    const value = (document.getElementById('newnote') as HTMLInputElement).value.trim();
    const today = toISODate(new Date());
    const tx = props.db.transaction('notes', 'readwrite');
    const store = tx.store;
    await store.put({text: value, nextRev: today, gap: 1, tags: []});
    await tx.done;
    setAdding(false);
    if (!sentence()) refetch();
  };

  // TODO: implement wrong answers
  // TODO: limit to nextRev before today
  // TODO: use FSRS instead of leitner
  //   (https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler)
  //   (https://github.com/open-spaced-repetition/fsrs.js)
  //   Alternatives include: supermemo v2, halflife regression duolingo
  const nextCard = async () => {
    const curr = sentence();
    curr.gap += 1;
    let d = new Date(curr.nextRev);
    d.setTime(d.getTime() + 1000 * 60 * 60 * 24 * curr.gap);
    curr.nextRev = toISODate(d);
    const tx = props.db.transaction('notes', 'readwrite');
    const store = tx.store;
    await store.put(curr);
    await tx.done;
    setSentence(null);
    refetch();
  };

  return (
    <>
      <div>Sentence <span>with boxes</span></div>
      <Show when={!data.loading}>
        <Show when={sentence()} fallback={
          <div>No sentence found.</div>
        }>
          <div>{sentence().text}</div>
          <button onClick={nextCard}>Next</button>
        </Show>
      </Show>
      <Show when={adding()}
        fallback={
          <div>
            <button onClick={() => setAdding(true)}>Add</button>
          </div>
        }
      >
        <div>New card:</div>
        <textarea id='newnote'></textarea>
        <div><button onClick={addCard}>Submit</button></div>
      </Show>
    </>
  );
};

export default App;
