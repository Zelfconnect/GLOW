# ADR 001: State Management Approach

## Status
Accepted

## Context
The application needs a state management solution to handle user data, goals, and application state. There are multiple options available in the React/React Native ecosystem including Redux, MobX, Zustand, Recoil, and the built-in Context API.

## Decision
We will use React's Context API with useReducer for state management.

## Rationale

### Why Context API + useReducer
- **Built-in Solution**: No additional dependencies required
- **Reduced Complexity**: Simpler than Redux for our scale
- **Familiarity**: Standard React pattern that developers are likely familiar with
- **Sufficient Performance**: For our app size and complexity, Context performance is adequate
- **Pattern Consistency**: Follows reducer pattern similar to Redux, making potential migration easier
- **Bundle Size**: Keeps bundle size smaller by not adding external libraries

### Why Not Redux
- **Overhead**: Adds complexity and boilerplate that may not be necessary for our app size
- **Dependencies**: Requires additional packages (redux, react-redux, etc.)
- **Learning Curve**: Steeper learning curve for new developers

### Why Not MobX
- **Mental Model**: Introduces a different mental model (observable state)
- **Magic**: More "magic" happening behind the scenes
- **Configuration**: Requires more setup and configuration

## Implementation Details
- Create a central context with a provider at the app root
- Use the reducer pattern to handle state updates
- Organize actions and reducers by feature domain
- Provide a custom hook (useAppContext) for consuming components

## Consequences
- Components will access global state via the Context API
- State updates will follow the reducer pattern (dispatch actions)
- Deep component trees might face performance issues if they all consume the same context
- If app complexity grows substantially, we may need to reconsider this decision

## Alternatives Considered
- **Redux**: More robust but more complex
- **Zustand**: Simple and performant, but another dependency
- **Recoil**: Facebook's experimental state management library
- **MobX**: Observable-based state management

## Related Decisions
- [Future ADR] Whether to split context into multiple smaller contexts for performance

## References
- [React Context Documentation](https://reactjs.org/docs/context.html)
- [useReducer Documentation](https://reactjs.org/docs/hooks-reference.html#usereducer) 