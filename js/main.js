async function submitWinners(game, classCategory, winner1, winner2, winner3, winnerHouse1, winnerHouse2, winnerHouse3) {
   showProcessingDialog();

   const selected = await selectData(
      'winners',
      fetchSingle = true,
      columns = "*",
      matchColumns = ['game', 'classcategory'],
      matchValues = [game, classCategory]
   );

   if (selected) {
      const updated = await updateRow(
         'winners',
         matchColumns = ['game', 'classcategory'],
         matchValues = [game, classCategory],
         updateColumns = ['winner1', 'winner2', 'winner3', 'winnerhouse1', 'winnerhouse2', 'winnerhouse3'],
         updateValues = [winner1, winner2, winner3, winnerHouse1, winnerHouse2, winnerHouse3]
      );
      hideProcessingDialog();
      if (updated) {
         showDialog({
            title: 'Success',
            message: 'Winners updated successfully!',
            type: 'alert'
         });
      } else {
         showDialog({
            title: 'Error',
            message: 'Error updating data!',
            type: 'alert'
         });
      }


   } else {
      const data = {
         game,
         "classcategory": classCategory,
         winner1,
         winner2,
         winner3,
         "winnerhouse1": winnerHouse1,
         "winnerhouse2": winnerHouse2,
         "winnerhouse3": winnerHouse3
      }
      const inserted = await insertData('winners', data);
      hideProcessingDialog();
      if (inserted) {
         showDialog({
            title: 'Success',
            message: 'Winners inserted successfully!',
            type: 'alert'
         });
      } else {
         showDialog({
            title: 'Error',
            message: 'Error inserting data!',
            type: 'alert'
         });
      }
   }

}