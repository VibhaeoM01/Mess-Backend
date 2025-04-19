const mealTimes = {
    breakfast: 8,
    lunch: 12,
    snacks: 17,
    dinner: 20,
  };
  
  export const getMealDateTime = (mealType, offsetHours = 0) => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      mealTimes[mealType] + offsetHours,
      0,
      0
    );
  };
  