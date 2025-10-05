declare module '*.json' {
  const value: {
    $defs: {
      kid: object;
      guardian: object;
      address: object;
      telephone: object;
    };
  };
  export default value;
}
