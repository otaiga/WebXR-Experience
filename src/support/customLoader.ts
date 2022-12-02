import { ILoadingScreen, Nullable } from "@babylonjs/core";

export class CustomLoadingScreen implements ILoadingScreen {
  private _loadingDiv!: Nullable<HTMLDivElement>;
  private _loadingTextP!: Nullable<HTMLParagraphElement>;
  private _progresssDiv!: Nullable<HTMLDivElement>;
  private _style!: Nullable<HTMLStyleElement>;
  private _logo!: HTMLImageElement;
  loadingUIBackgroundColor!: string;

  /** Gets or sets the logo url to use for the default loading screen */
  public static DefaultLogoUrl = "";

  /** Gets or sets the spinner url to use for the default loading screen */
  public static DefaultSpinnerUrl = "";

  /**
   * Creates a new default loading screen
   * @param _renderingCanvas defines the canvas used to render the scene
   * @param _loadingText defines the default text to display
   * @param _progress defines the percentage width of progress bar
   */
  constructor(
    private _renderingCanvas: HTMLCanvasElement,
    private _loadingText = "loading...",
    private _progress = "0"
  ) {
    this._logo = document.createElement("img");
    this._logo.src = `${window.location.href}/assets/images/loader.gif`;
    this._logo.style.width = "150px";
    this._logo.style.objectFit = "contain";
    this._logo.alt = "loading logo";
  }

  /**
   * Function called to display the loading screen
   */
  public displayLoadingUI(): void {
    if (this._loadingDiv) {
      // Do not add a loading screen if there is already one
      return;
    }

    // parent div
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "loadingScreen";
    this._loadingDiv.style.height = "100vh";
    this._loadingDiv.style.pointerEvents = "none";
    this._loadingDiv.style.opacity = "0";
    this._loadingDiv.style.backgroundColor = "black";
    this._loadingDiv.style.zIndex = "-12";
    this._loadingDiv.style.transition = "opacity 1.5s ease";

    // loading container
    const loadingContainer = document.createElement("div");
    loadingContainer.style.display = "flex";
    loadingContainer.style.alignItems = "center";
    loadingContainer.style.justifyItems = "center";
    loadingContainer.style.justifyContent = "center";
    loadingContainer.style.minHeight = "100%";
    loadingContainer.style.textAlign = "center";
    // div holder
    const div = document.createElement("div");
    // container
    const container = document.createElement("div");
    container.style.color = "rgba(66, 135, 245, 1)";
    container.style.textAlign = "center";

    // holder
    const holder = document.createElement("div");
    holder.id = "holder";
    holder.style.lineHeight = "1.5";
    holder.style.borderRadius = "9999px";
    holder.style.background = "white";
    holder.style.height = "200px";
    holder.style.width = "200px";
    holder.style.display = "flex";
    holder.style.alignItems = "center";
    holder.style.justifyContent = "center";
    holder.appendChild(this._logo);
    container.appendChild(holder);

    // Heading
    const heading = document.createElement("h3");
    heading.innerHTML = "Please hang tight..";
    heading.style.fontSize = "1.125rem";
    heading.style.lineHeight = "1.5rem";
    heading.style.fontWeight = "500";

    container.appendChild(heading);

    // Loading text
    this._loadingTextP = document.createElement("p");
    this._loadingTextP.innerHTML = this._loadingText;

    container.appendChild(this._loadingTextP);

    // Update section
    const updateDiv = document.createElement("div");
    updateDiv.style.width = "100%";
    updateDiv.style.backgroundColor = "gray";
    updateDiv.style.borderRadius = "9999px";
    updateDiv.style.height = "0.625rem";

    // Percent section
    this._progresssDiv = document.createElement("div");
    this._progresssDiv.style.width = this._progress;
    this._progresssDiv.style.backgroundColor = "blue";
    this._progresssDiv.style.height = "0.625rem";
    this._progresssDiv.style.borderRadius = "9999px";

    updateDiv.appendChild(this._progresssDiv);

    container.appendChild(updateDiv);

    div.appendChild(container);
    loadingContainer.appendChild(div);
    this._loadingDiv.appendChild(loadingContainer);
    document.body.appendChild(this._loadingDiv);
    this._resizeLoadingUI();
    this._loadingDiv.style.opacity = "1";
  }

  /**
   * Function called to hide the loading screen
   */
  public hideLoadingUI(): void {
    if (!this._loadingDiv) {
      return;
    }

    const onTransitionEnd = () => {
      if (this._loadingDiv) {
        this._loadingDiv.remove();
        this._loadingDiv = null;
      }
      if (this._style) {
        this._style.remove();
        this._style = null;
      }
    };

    this._loadingDiv.style.opacity = "0";
    this._loadingDiv.addEventListener("transitionend", onTransitionEnd);
  }

  /**
   * Gets or sets the text to display while loading
   */
  public set loadingUIText(text: string) {
    this._loadingText = text;

    if (this._loadingTextP) {
      this._loadingTextP.innerHTML = this._loadingText;
    }
  }

  public get loadingUIText(): string {
    return this._loadingText;
  }

  public set progress(text: string) {
    this._progress = text;

    if (this._progresssDiv) {
      this._progresssDiv.style.width = this._progress;
    }
  }

  public get progress(): string {
    return this._progress;
  }

  // Resize
  private _resizeLoadingUI = () => {
    const canvasRect = this._renderingCanvas.getBoundingClientRect();
    const canvasPositioning = window.getComputedStyle(
      this._renderingCanvas
    ).position;

    if (!this._loadingDiv) {
      return;
    }

    this._loadingDiv.style.position =
      canvasPositioning === "fixed" ? "fixed" : "absolute";
    this._loadingDiv.style.left = canvasRect.left + "px";
    this._loadingDiv.style.top = canvasRect.top + "px";
    this._loadingDiv.style.width = canvasRect.width + "px";
    this._loadingDiv.style.height = canvasRect.height + "px";
  };
}
