function makeWorksheet(item) {
  const worksheet = {};

  worksheet['A1'] = { v: translate[locale].billCode, s: { font: { bold: true, sz: 14 } } };
  worksheet['A2'] = { v: translate[locale].movieName, s: { font: { bold: true, sz: 14 } } };
  worksheet['A3'] = { v: translate[locale].billTotalPriceFromTicket + ' (VNĐ)', s: { font: { bold: true, sz: 14 } } };
  worksheet['A4'] = { v: translate[locale].billTotalPriceFromFood + ' (VNĐ)', s: { font: { bold: true, sz: 14 } } };
  worksheet['A5'] = { v: translate[locale].billStatus, s: { font: { bold: true, sz: 14 } } };
  worksheet['A6'] = { v: translate[locale].billType, s: { font: { bold: true, sz: 14 } } };
  worksheet['A7'] = { v: translate[locale].billBankCode, s: { font: { bold: true, sz: 14 } } };
  worksheet['A8'] = { v: translate[locale].billTranNo, s: { font: { bold: true, sz: 14 } } };
  worksheet['A9'] = { v: translate[locale].billPayTime, s: { font: { bold: true, sz: 14 } } };
  worksheet['A10'] = { v: translate[locale].billTotalPrice + ' (VNĐ)', s: { font: { bold: true, sz: 14 } } };

  worksheet['B1'] = { v: `BILL${item.id}`, s: { font: { bold: true, sz: 14 } } };
  worksheet['B2'] = { v: item.movie.name, s: { font: { bold: true, sz: 14 } } };
  worksheet['B3'] = { v: item.totalPriceFromTicket, s: { font: { bold: true, sz: 14 } } };
  worksheet['B4'] = { v: item.totalPriceFromFood, s: { font: { bold: true, sz: 14 } } };
  worksheet['B5'] = { v: item.status, s: { font: { bold: true, sz: 14 } } };
  worksheet['B6'] = { v: item.type, s: { font: { bold: true, sz: 14 } } };
  worksheet['B7'] = { v: item.bankCode, s: { font: { bold: true, sz: 14 } } };
  worksheet['B8'] = { v: item.bankTranNo, s: { font: { bold: true, sz: 14 } } };
  worksheet['B9'] = { v: item.payTime, s: { font: { bold: true, sz: 14 } } };
  worksheet['B10'] = { v: Number(item.totalPrice).toLocaleString('vi'), s: { font: { bold: true, sz: 14 } } };

  worksheet['A12'] = { v: translate[locale].numericalOrder, s: { font: { bold: true, sz: 14 } } };
  worksheet['B12'] = { v: translate[locale].ticketCode, s: { font: { bold: true, sz: 14 } } };
  worksheet['C12'] = { v: translate[locale].ticketSeat, s: { font: { bold: true, sz: 14 } } };
  worksheet['D12'] = { v: translate[locale].ticketType, s: { font: { bold: true, sz: 14 } } };
  worksheet['E12'] = { v: translate[locale].ticketPrice + ' (VNĐ)', s: { font: { bold: true, sz: 14 } } };
  worksheet['F12'] = { v: translate[locale].ticketRoom, s: { font: { bold: true, sz: 14 } } };
  worksheet['G12'] = { v: translate[locale].ticketSchedule, s: { font: { bold: true, sz: 14 } } };
  worksheet['H12'] = { v: translate[locale].ticketAction, s: { font: { bold: true, sz: 14 } } };
  for (let i = 0 ; i < item.tickets.length; i++) {
    const ticket = item.tickets[i];

    let action = null;
    if (!ticket.reasonReject && checkValidTime(ticket.schedule)) {
      action = translate[locale].ticketNoWatch;
    }
    if (ticket.reasonReject) {
      action = ticket.reasonReject;
    }
    if (!ticket.reasonReject && !checkValidTime(ticket.schedule)) {
      action = translate[locale].ticketViewed;
    }

    worksheet['A'+(13+i)] = { v: i + 1, s: { font: { sz: 14 } } };
    worksheet['B'+(13+i)] = { v: `TICKET${ticket.id}`, s: { font: { sz: 14 } } };
    worksheet['C'+(13+i)] = { v: ticket.seat, s: { font: { sz: 14 } } };
    worksheet['D'+(13+i)] = { v: ticket.type, s: { font: { sz: 14 } } };
    worksheet['E'+(13+i)] = { v: Number(ticket.price).toLocaleString('vi'), s: { font: { sz: 14 } } };
    worksheet['F'+(13+i)] = { v: ticket.room, s: { font: { sz: 14 } } };
    worksheet['G'+(13+i)] = { v: ticket.schedule, s: { font: { sz: 14 } } };
    worksheet['H'+(13+i)] = { v: action, s: { font: { sz: 14 } } };
  }

  if (item?.purchasedFoods?.length) {
    worksheet['A'+(14+item.tickets.length)] = { v: translate[locale].numericalOrder, s: { font: { bold: true, sz: 14 } } };
    worksheet['B'+(14+item.tickets.length)] = { v: translate[locale].foodCode, s: { font: { bold: true, sz: 14 } } };
    worksheet['C'+(14+item.tickets.length)] = { v: translate[locale].foodImage, s: { font: { bold: true, sz: 14 } } };
    worksheet['D'+(14+item.tickets.length)] = { v: translate[locale].foodPrice + ' (VNĐ)', s: { font: { bold: true, sz: 14 } } };
    worksheet['E'+(14+item.tickets.length)] = { v: translate[locale].foodQuantity, s: { font: { bold: true, sz: 14 } } };
    worksheet['F'+(14+item.tickets.length)] = { v: translate[locale].foodDescription, s: { font: { bold: true, sz: 14 } } };
    for (let i = 0; i < item.purchasedFoods.length; i++) {
      const food = item.purchasedFoods[i];
  
      worksheet['A'+(15+item.tickets.length+i)] = { v: i + 1, s: { font: { sz: 14 } } };
      worksheet['B'+(15+item.tickets.length+i)] = { v: `FOOD${food.id}`, s: { font: { sz: 14 } } };
      worksheet['C'+(15+item.tickets.length+i)] = { v: food.image, s: { font: { sz: 14 } } };
      worksheet['D'+(15+item.tickets.length+i)] = { v: Number(food.price).toLocaleString('vi'), s: { font: { sz: 14 } } };
      worksheet['E'+(15+item.tickets.length+i)] = { v: food.quantity, s: { font: { sz: 14 } } };
      worksheet['F'+(15+item.tickets.length+i)] = { v: food.description, s: { font: { sz: 14 } } };
    }
  }

  // Thiết lập phạm vi của worksheet
  const range = { s: { c: 0, r: 0 }, e: { c: 7, r: (item.tickets.length + item.purchasedFoods.length + 13) } };
  worksheet['!ref'] = XLSX.utils.encode_range(range);

  // Thiết lập độ rộng các cột
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 }
  ];

  return worksheet;
}

function exportExcel(items, page) {
  const workbook = XLSX.utils.book_new();
  for (let item of items) {
    const worksheet = makeWorksheet(item);
    XLSX.utils.book_append_sheet(workbook, worksheet, `BILL${item.id}`);
  }
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(blob, `${new Date().getTime()}_page${page}.xlsx`);
}
