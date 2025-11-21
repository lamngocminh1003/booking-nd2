import {
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
const CustomToolbar = ({ fileName }) => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        printOptions={{ disableToolbarButton: true }}
        csvOptions={{
          fileName: fileName,
          utf8WithBom: true,
        }}
      />
    </GridToolbarContainer>
  );
};
export default CustomToolbar;
